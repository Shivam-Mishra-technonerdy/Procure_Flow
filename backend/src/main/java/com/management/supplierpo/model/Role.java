package com.management.supplierpo.model;

public enum Role {
    ADMIN,
    SUPPLIER,
    BUYER;

    public static Role fromString(String val) {
        if (val == null) return null;
        String clean = val.trim().replace("ROLE_", "").toUpperCase();
        return Role.valueOf(clean);
    }
}
