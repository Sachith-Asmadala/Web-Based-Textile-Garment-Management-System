package lk.ac.sliit.tgms.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiNotFoundController {

    @RequestMapping("/api/{*path}")
    public ResponseEntity<ApiErrorResponse> notFound() {
        ApiError error = new ApiError("NOT_FOUND", "The requested resource was not found.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiErrorResponse(error));
    }

    public record ApiError(String code, String message) {}

    public record ApiErrorResponse(ApiError error) {}
}

