package com.servicehub.controller;

import com.servicehub.model.Message;
import com.servicehub.security.CustomUserDetails;
import com.servicehub.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PROVIDER', 'ADMIN')")
    public ResponseEntity<List<Message>> getMyMessages(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                messageService.getMessagesForUser(userDetails.getUser().getId())
        );
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('PROVIDER', 'ADMIN')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
