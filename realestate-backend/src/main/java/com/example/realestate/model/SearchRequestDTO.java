package com.example.realestate.model;
import java.util.List;
public class SearchRequestDTO {


        private List<String> locations;
        private String propertyType;
        private String budgetRange;

        public SearchRequestDTO() {}

        public SearchRequestDTO(List<String> locations, String propertyType, String budgetRange) {
            this.locations = locations;
            this.propertyType = propertyType;
            this.budgetRange = budgetRange;
        }

        public List<String> getLocations() {
            return locations;
        }

        public void setLocations(List<String> locations) {
            this.locations = locations;
        }

        public String getPropertyType() {
            return propertyType;
        }

        public void setPropertyType(String propertyType) {
            this.propertyType = propertyType;
        }

        public String getBudgetRange() {
            return budgetRange;
        }

        public void setBudgetRange(String budgetRange) {
            this.budgetRange = budgetRange;
        }

}
