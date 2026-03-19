package com.servicehub.dto.request;

// IT REPRESENTS THE DATA THAT THE USER SENDS DURING LOGIN

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequest {
    @Email @NotBlank private String email;
    @NotBlank private String password;
}
