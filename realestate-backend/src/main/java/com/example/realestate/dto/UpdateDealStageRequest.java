package com.example.realestate.dto;

// This DTO is used to accept JSON data for updating a deal's stage.
public class UpdateDealStageRequest {

    // The new stage, likely a string corresponding to an Enum (e.g., "AGREEMENT", "COMPLETED")
    public String stage;

    // Optional notes/comments about the stage update
    public String notes;

    // Standard getters and setters

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}