spyre <- function(x, ...) {
    UseMethod("spyre")
}

spyre.default <- function(x, ...) {
    summary <- paste(capture.output(str(x)), collapse = "\n")
    ## need a way to limit size of x (likely)
    list(event = "object", data = list(summary = summary,
                                value = x))
}

spyre.data.frame <- function(x, ...) {
    summary <- paste(capture.output(summary(x)), collapse = "\n")
    list(event = "object", data = list(summary = summary, value = x))
}


spyre.factor <- function(x, ...) {
    summary <- paste(c(capture.output(table(x)),
                   capture.output(levels(x))), collapse = "\n")

    value <- data.frame(var = x)

    ggvis_plot <- qvis(value, ~var)
    ggvis_spec <-
        unbox(paste0(capture.output(ggvis:::show_spec(ggvis_plot, FALSE)),
                     collapse = ""))
    
    ## need a way to limit size of x (likely)
    list(event = "object", data = list(summary = summary,
                               value = ggvis_spec))
    
}

spyre.numeric <- function(x, ...) {
    summary <- paste(capture.output(summary(x)), collapse = "\n")
    cat(summary)

    value <- data.frame(var = x)

    ggvis_plot <- qvis(value, ~var)
    ggvis_spec <-
        unbox(paste0(capture.output(ggvis:::show_spec(ggvis_plot, FALSE)),
                     collapse = ""))
    
    ## need a way to limit size of x (likely)
    list(event = "object", data = list(summary = summary,
                               value = ggvis_spec))
    
}


spyre.function <- function(x, ...) {
    value <- paste(capture.output(args(x)), collapse = "\n")
    list(event = "object", data = list(summary = value))
}

## think what we want for summary/value, raw or summarized?
## should summarized be a single string in JSON?

A_spyre_numeric_test <- rnorm(100)
A_spyre_factor_test <- as.factor(sample(c("male", "female"), 20,
                                        replace = TRUE))
A_spyre_factor_test2 <- as.factor(sample(c("male", "female"), 200,
                                        replace = TRUE))

A_spyre_factor_test3 <- as.factor(sample(c("male", "female", "other"), 200,
                                        replace = TRUE))

