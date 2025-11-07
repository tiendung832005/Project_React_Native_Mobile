package com.data.project_reactnative.dto;

public class UploadMediaResponse {
    private String imageUrl;

    public UploadMediaResponse() {
    }

    public UploadMediaResponse(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}


