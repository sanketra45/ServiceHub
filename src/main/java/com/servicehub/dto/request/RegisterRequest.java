package com.servicehub.dto.request;

// THIS CLASS REPRESENTS THE DATA THAT THE USER SENDS DURING REGISTRATIONS

import com.servicehub.model.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
//    THIS ARE THE FIELDS THAT USER SENDS
    @NotBlank private String name;
    @Email @NotBlank private String email;
    @Size(min = 6) private String password;
    @NotBlank private String phone;
    @NotNull private Role role;  // CUSTOMER or PROVIDER
}
