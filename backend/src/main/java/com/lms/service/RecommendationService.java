package com.lms.service;

import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import opennlp.tools.tokenize.SimpleTokenizer;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // Standard list of stop words to filter out
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
            "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
            "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
            "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
            "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
            "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
            "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
            "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't",
            "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
            "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this",
            "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd",
            "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's",
            "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
            "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
    ));

    public RecommendationService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public static class RecommendationResult {
        private Course course;
        private double score;
        private String explanation;

        public RecommendationResult(Course course, double score, String explanation) {
            this.course = course;
            this.score = score;
            this.explanation = explanation;
        }

        public Course getCourse() { return course; }
        public double getScore() { return score; }
        public String getExplanation() { return explanation; }
    }

    public List<RecommendationResult> getRecommendations(String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<Course> approvedCourses = courseRepository.findByApprovedTrue();
        if (approvedCourses.isEmpty()) {
            return Collections.emptyList();
        }

        // Build Student profile text
        StringBuilder studentText = new StringBuilder();
        if (student.getInterests() != null) studentText.append(student.getInterests()).append(" ");
        if (student.getSkills() != null) studentText.append(student.getSkills());

        List<String> studentTokens = tokenize(studentText.toString());
        if (studentTokens.isEmpty()) {
            // Return courses with default low similarity or category match if profile is empty
            return approvedCourses.stream()
                    .map(c -> new RecommendationResult(c, 0.0, "Recommended based on general popular topics."))
                    .collect(Collectors.toList());
        }

        // Create corpus: student profile + all courses
        List<List<String>> corpus = new ArrayList<>();
        corpus.add(studentTokens);

        Map<Long, List<String>> courseTokenMap = new HashMap<>();
        for (Course course : approvedCourses) {
            StringBuilder courseText = new StringBuilder();
            courseText.append(course.getTitle()).append(" ")
                    .append(course.getCategory()).append(" ")
                    .append(course.getSkillsTags() != null ? course.getSkillsTags() : "").append(" ")
                    .append(course.getDescription());
            
            List<String> courseTokens = tokenize(courseText.toString());
            courseTokenMap.put(course.getId(), courseTokens);
            corpus.add(courseTokens);
        }

        // Compute IDF for all terms in the corpus
        Map<String, Double> idfMap = computeIDF(corpus);

        // Vectorize Student
        Map<String, Double> studentVector = computeTFIDF(studentTokens, idfMap);

        List<RecommendationResult> recommendations = new ArrayList<>();

        for (Course course : approvedCourses) {
            List<String> courseTokens = courseTokenMap.get(course.getId());
            Map<String, Double> courseVector = computeTFIDF(courseTokens, idfMap);

            double similarity = computeCosineSimilarity(studentVector, courseVector);

            // Generate Explanation based on shared high-weight terms
            String explanation = generateExplanation(student, course, studentVector, courseVector);

            recommendations.add(new RecommendationResult(course, similarity, explanation));
        }

        // Sort by similarity descending, return all that have some similarity, or rank them
        recommendations.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        return recommendations;
    }

    private List<String> tokenize(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptyList();
        }
        // Use OpenNLP SimpleTokenizer
        String[] tokens = SimpleTokenizer.INSTANCE.tokenize(text.toLowerCase());
        List<String> filtered = new ArrayList<>();
        for (String t : tokens) {
            // Filter words, length > 1, not matching stop-words and matches characters/numbers
            if (t.length() > 1 && !STOP_WORDS.contains(t) && t.matches("^[a-zA-Z0-9#-+#]+$")) {
                filtered.add(t);
            }
        }
        return filtered;
    }

    private Map<String, Double> computeIDF(List<List<String>> documents) {
        Map<String, Double> idf = new HashMap<>();
        int N = documents.size();

        for (List<String> doc : documents) {
            Set<String> uniqueTerms = new HashSet<>(doc);
            for (String term : uniqueTerms) {
                idf.put(term, idf.getOrDefault(term, 0.0) + 1.0);
            }
        }

        for (Map.Entry<String, Double> entry : idf.entrySet()) {
            double docFreq = entry.getValue();
            // IDF = ln(1 + N / (1 + docFreq))
            double val = Math.log(1.0 + (double) N / (1.0 + docFreq));
            idf.put(entry.getKey(), val);
        }

        return idf;
    }

    private Map<String, Double> computeTFIDF(List<String> docTokens, Map<String, Double> idfMap) {
        Map<String, Double> tfidf = new HashMap<>();
        if (docTokens.isEmpty()) return tfidf;

        // Calculate term frequency (Raw frequency counts)
        for (String token : docTokens) {
            tfidf.put(token, tfidf.getOrDefault(token, 0.0) + 1.0);
        }

        // Compute TF-IDF
        for (Map.Entry<String, Double> entry : tfidf.entrySet()) {
            String term = entry.getKey();
            double tf = entry.getValue() / docTokens.size(); // normalized TF
            double idf = idfMap.getOrDefault(term, 0.0);
            tfidf.put(term, tf * idf);
        }

        return tfidf;
    }

    private double computeCosineSimilarity(Map<String, Double> vec1, Map<String, Double> vec2) {
        if (vec1.isEmpty() || vec2.isEmpty()) return 0.0;

        double dotProduct = 0.0;
        for (String term : vec1.keySet()) {
            if (vec2.containsKey(term)) {
                dotProduct += vec1.get(term) * vec2.get(term);
            }
        }

        double norm1 = 0.0;
        for (double val : vec1.values()) {
            norm1 += val * val;
        }

        double norm2 = 0.0;
        for (double val : vec2.values()) {
            norm2 += val * val;
        }

        if (norm1 == 0.0 || norm2 == 0.0) return 0.0;

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    private String generateExplanation(User student, Course course, Map<String, Double> studentVec, Map<String, Double> courseVec) {
        // Collect overlapping tokens that represent real technical concepts
        List<String> matchingInterests = new ArrayList<>();
        
        Set<String> studentSkills = new HashSet<>();
        if (student.getInterests() != null) {
            for (String s : student.getInterests().split(",")) studentSkills.add(s.trim().toLowerCase());
        }
        if (student.getSkills() != null) {
            for (String s : student.getSkills().split(",")) studentSkills.add(s.trim().toLowerCase());
        }

        // Collect words in the course metadata that overlap with student interests/skills
        String courseTags = course.getSkillsTags();
        if (courseTags != null) {
            for (String tag : courseTags.split(",")) {
                String cleanTag = tag.trim().toLowerCase();
                if (studentSkills.contains(cleanTag)) {
                    matchingInterests.add(tag.trim());
                }
            }
        }

        // Fallback or addition: find direct word overlaps in vectors
        if (matchingInterests.isEmpty()) {
            for (String term : studentVec.keySet()) {
                if (courseVec.containsKey(term) && term.length() > 2) {
                    matchingInterests.add(capitalize(term));
                }
            }
        }

        // Remove duplicates
        List<String> uniqueMatches = new ArrayList<>(new LinkedHashSet<>(matchingInterests));

        if (!uniqueMatches.isEmpty()) {
            if (uniqueMatches.size() > 3) {
                uniqueMatches = uniqueMatches.subList(0, 3);
            }
            String matchesJoined = String.join(", ", uniqueMatches);
            return "Recommended because you have interests/skills in " + matchesJoined + ".";
        }

        // Category fallback explanation
        if (student.getInterests() != null && student.getInterests().toLowerCase().contains(course.getCategory().toLowerCase())) {
            return "Recommended because you are interested in the '" + course.getCategory() + "' category.";
        }

        return "Recommended based on trending topics in " + course.getCategory() + ".";
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
