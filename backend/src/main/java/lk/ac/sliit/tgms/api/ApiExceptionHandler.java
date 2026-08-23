package lk.ac.sliit.tgms.api;

import java.util.LinkedHashMap;
import java.util.Map;
import lk.ac.sliit.tgms.auth.EmailAlreadyRegisteredException;
import lk.ac.sliit.tgms.auth.InvalidCredentialsException;
import lk.ac.sliit.tgms.auth.InvalidSessionException;
import lk.ac.sliit.tgms.auth.PasswordPolicyException;
import lk.ac.sliit.tgms.product.InactiveProductCategoryException;
import lk.ac.sliit.tgms.product.ProductNotFoundException;
import lk.ac.sliit.tgms.product.ProductNotSelectableException;
import lk.ac.sliit.tgms.product.ProductValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> validationFailed(
            MethodArgumentNotValidException exception) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.withFields(
                        "VALIDATION_ERROR", "Please correct the highlighted fields.", fields));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> malformedRequest() {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of("INVALID_REQUEST", "Request body must be valid JSON."));
    }

    @ExceptionHandler(PasswordPolicyException.class)
    public ResponseEntity<ApiErrorResponse> passwordPolicy(PasswordPolicyException exception) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.withFields(
                        "VALIDATION_ERROR", "Please correct the highlighted fields.",
                        Map.of("password", exception.getMessage())));
    }

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<ApiErrorResponse> emailConflict(
            EmailAlreadyRegisteredException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.of("EMAIL_ALREADY_REGISTERED", exception.getMessage()));
    }

    @ExceptionHandler(ProductValidationException.class)
    public ResponseEntity<ApiErrorResponse> productValidation(
            ProductValidationException exception) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.withFields(
                        "VALIDATION_ERROR", exception.getMessage(), exception.fields()));
    }

    @ExceptionHandler(InactiveProductCategoryException.class)
    public ResponseEntity<ApiErrorResponse> inactiveProductCategory(
            InactiveProductCategoryException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.of("CATEGORY_INACTIVE", exception.getMessage()));
    }

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> productNotFound(ProductNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of("PRODUCT_NOT_FOUND", exception.getMessage()));
    }

    @ExceptionHandler(ProductNotSelectableException.class)
    public ResponseEntity<ApiErrorResponse> productNotSelectable(
            ProductNotSelectableException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.of("PRODUCT_NOT_SELECTABLE", exception.getMessage()));
    }

    @ExceptionHandler({InvalidCredentialsException.class, InvalidSessionException.class})
    public ResponseEntity<ApiErrorResponse> unauthorized(RuntimeException exception) {
        String code = exception instanceof InvalidCredentialsException
                ? "INVALID_CREDENTIALS"
                : "INVALID_SESSION";
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorResponse.of(code, exception.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> accessDenied() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasAuthenticatedUser = authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);

        if (!hasAuthenticatedUser) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiErrorResponse.of(
                            "UNAUTHORIZED", "Authentication is required."));
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiErrorResponse.of(
                        "FORBIDDEN", "You do not have permission to perform this action."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> unexpectedFailure(Exception exception) {
        LOGGER.error("Unhandled API failure", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorResponse.of(
                        "INTERNAL_ERROR", "The request could not be completed."));
    }
}
