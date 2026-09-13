package com.lms.repository;

import com.lms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findByApprovedTrue();
    
    List<Course> findByApprovedFalse();
    
    List<Course> findByInstructorId(Long instructorId);

    @Query("SELECT c FROM Course c WHERE c.approved = true AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.skillsTags) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Course> searchCourses(@Param("query") String query);

    @Query("SELECT c FROM Course c WHERE c.approved = true AND " +
           "LOWER(c.category) = LOWER(:category)")
    List<Course> findByCategory(@Param("category") String category);
}
