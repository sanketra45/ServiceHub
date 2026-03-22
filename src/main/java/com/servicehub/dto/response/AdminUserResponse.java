package com.servicehub.dto.response;

// THIS CLASS SENDS THE USER INFO DATA FROM BACKEND TO THE ADMIN PANEL

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private boolean enabled;
}
