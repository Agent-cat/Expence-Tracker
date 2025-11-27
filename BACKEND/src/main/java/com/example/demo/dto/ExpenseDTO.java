package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDTO {
    private Long id;
    private String description;
    private Double amount;
    private String category;
    private Long expenseDate;
    private String notes;
    private Long createdAt;
    private Long updatedAt;
}
