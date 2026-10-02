package com.management.supplierpo.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateUserStatusRequest {

    @NotNull(message = "Active status flag is required")
    private Boolean active;

    public UpdateUserStatusRequest() {}
    public UpdateUserStatusRequest(Boolean active) { this.active = active; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
