package com.lms.dto;

public class ProfileRequest {
    private String name;
    private String interests;
    private String skills;

    public ProfileRequest() {}

    public ProfileRequest(String name, String interests, String skills) {
        this.name = name;
        this.interests = interests;
        this.skills = skills;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
}
