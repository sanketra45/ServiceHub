package com.servicehub.service;

import com.servicehub.model.Booking;
import com.servicehub.model.Message;
import com.servicehub.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public void sendBookingMessage(Booking booking) {
        String content = String.format("New booking request for %s on %s at %s.",
                booking.getServiceType(), booking.getBookingDate(), booking.getTimeSlot());

        Message message = Message.builder()
                .content(content)
                .senderName(booking.getCustomer().getName())
                .receiverId(booking.getProvider().getUser().getId())
                .bookingId(booking.getId())
                .build();

        messageRepository.save(message);
    }

    public List<Message> getMessagesForUser(Long userId) {
        return messageRepository.findByReceiverIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long messageId) {
        messageRepository.findById(messageId).ifPresent(m -> {
            m.setRead(true);
            messageRepository.save(m);
        });
    }
}
