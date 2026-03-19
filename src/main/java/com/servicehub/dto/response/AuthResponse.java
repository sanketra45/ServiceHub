package com.servicehub.dto.response;

// IT REPRESENTS THE DATA THAT THE BACKEND SENDS AFTER SUCCESSFUL REGISTRATION

import lombok.*;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private String name;
}
