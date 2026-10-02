package com.management.supplierpo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Supplier name is required")
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "contact_name", length = 150)
    private String contactName;

    @Email(message = "Invalid email format")
    @Column(name = "email", unique = true, length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone_country_code", length = 8)
    private String phoneCountryCode;

    @Column(name = "phone_number", length = 25)
    private String phoneNumber;

    @Column(name = "country_code", length = 2)
    private String countryCode;

    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state_province", length = 100)
    private String stateProvince;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "is_demo", nullable = false)
    private Boolean isDemo = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    private Double rating = 4.5;

    public Supplier() {
    }

    public Supplier(Long id, String name, String companyName, String contactEmail, String phone, String address, String category, Double rating, String status) {
        this.id = id;
        this.name = (companyName != null && !companyName.isEmpty()) ? companyName : name;
        this.contactName = name;
        this.email = contactEmail;
        this.phone = phone;
        this.address = address;
        this.category = category;
        this.rating = rating != null ? rating : 4.5;
        this.active = !"INACTIVE".equalsIgnoreCase(status);
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.active == null) {
            this.active = true;
        }
        if (this.isDemo == null) {
            this.isDemo = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCompanyName() { return name; }
    public void setCompanyName(String companyName) {
        if (companyName != null && !companyName.isEmpty()) {
            this.name = companyName;
        }
    }

    public String getContactEmail() { return email; }
    public void setContactEmail(String contactEmail) { this.email = contactEmail; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhoneCountryCode() { return phoneCountryCode; }
    public void setPhoneCountryCode(String phoneCountryCode) { this.phoneCountryCode = phoneCountryCode; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getStateProvince() { return stateProvince; }
    public void setStateProvince(String stateProvince) { this.stateProvince = stateProvince; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        if (addressLine1 != null && !addressLine1.isBlank()) sb.append(addressLine1);
        if (addressLine2 != null && !addressLine2.isBlank()) sb.append(", ").append(addressLine2);
        if (city != null && !city.isBlank()) sb.append(", ").append(city);
        if (stateProvince != null && !stateProvince.isBlank()) sb.append(", ").append(stateProvince);
        if (postalCode != null && !postalCode.isBlank()) sb.append(" ").append(postalCode);
        if (countryCode != null && !countryCode.isBlank()) sb.append(", ").append(countryCode);
        String formatted = sb.toString();
        return !formatted.isBlank() ? formatted : (address != null ? address : "N/A");
    }

    public String getFormattedPhone() {
        if (phoneCountryCode != null && !phoneCountryCode.isBlank() && phoneNumber != null && !phoneNumber.isBlank()) {
            return phoneCountryCode + " " + phoneNumber;
        }
        return phone != null ? phone : "N/A";
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getRating() { return rating != null ? rating : 4.5; }
    public void setRating(Double rating) { this.rating = rating; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Boolean getIsDemo() { return isDemo != null ? isDemo : false; }
    public void setIsDemo(Boolean isDemo) { this.isDemo = isDemo; }
    public boolean isDemo() { return Boolean.TRUE.equals(isDemo); }

    public String getStatus() { return Boolean.TRUE.equals(active) ? "ACTIVE" : "INACTIVE"; }
    public void setStatus(String status) { this.active = !"INACTIVE".equalsIgnoreCase(status); }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

