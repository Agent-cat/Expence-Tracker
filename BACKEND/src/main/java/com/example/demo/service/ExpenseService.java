package com.example.demo.service;

import com.example.demo.dto.ExpenseDTO;
import com.example.demo.entity.Expense;
import com.example.demo.entity.User;
import com.example.demo.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserService userService;

    public ExpenseDTO createExpense(String email, ExpenseDTO expenseDTO) {
        User user = userService.findByEmail(email);

        Expense expense = new Expense();
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setCategory(expenseDTO.getCategory());
        expense.setExpenseDate(expenseDTO.getExpenseDate());
        expense.setNotes(expenseDTO.getNotes());
        expense.setUser(user);

        expense = expenseRepository.save(expense);
        return convertToDTO(expense);
    }

    public ExpenseDTO updateExpense(String email, @NonNull Long expenseId, ExpenseDTO expenseDTO) {
        User user = userService.findByEmail(email);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setCategory(expenseDTO.getCategory());
        expense.setExpenseDate(expenseDTO.getExpenseDate());
        expense.setNotes(expenseDTO.getNotes());

        expense = expenseRepository.save(expense);
        return convertToDTO(expense);
    }

    public void deleteExpense(String email, @NonNull Long expenseId) {
        User user = userService.findByEmail(email);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        expenseRepository.delete(expense);
    }

    public ExpenseDTO getExpense(String email, @NonNull Long expenseId) {
        User user = userService.findByEmail(email);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return convertToDTO(expense);
    }

    public List<ExpenseDTO> getAllExpenses(String email) {
        User user = userService.findByEmail(email);
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(user.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ExpenseDTO> getExpensesByCategory(String email, String category) {
        User user = userService.findByEmail(email);
        return expenseRepository.findByUserIdAndCategory(user.getId(), category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        return new ExpenseDTO(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getExpenseDate(),
                expense.getNotes(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }
}
