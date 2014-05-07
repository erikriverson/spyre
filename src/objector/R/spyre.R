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

    value <- as.data.frame(table(x))
    names(value) <- c("var", "Freq")
    value$var <- as.numeric(factor(value$var))

    value <- value[order(value$Freq, decreasing = TRUE), ]

    ggvis_plot <-  ggvis(value, props(x = ~var,
                                      y = ~Freq)) +
                   dscale("x", "nominal", padding = 0, points = FALSE) +
                       mark_rect(props(y2 = 0, width = band()))

  ## Bar graph with categorical x
  ##   ggvis_plot <- ggvis(pressure, props(x = ~temperature, y = ~pressure)) +
  ## dscale("x", "nominal", padding = 0, points = FALSE) +
  ## mark_rect(props(y2 = 0, width = band()))

    ggvis:::show_spec(ggvis_plot, FALSE)

    ggvis_spec <- unbox(paste0(capture.output(ggvis:::show_spec(ggvis_plot, FALSE)),
                               collapse = ""))
    
    ## need a way to limit size of x (likely)
    list(event = "object", data = list(summary = summary, value = ggvis_spec))
    
}

spyre.function <- function(x, ...) {
    value <- paste(capture.output(args(x)), collapse = "\n")
    list(event = "object", data = list(summary = value))
}

## think what we want for summary/value, raw or summarized?
## should summarized be a single string in JSON?

A_spyre_numeric_test <- 1:10
A_spyre_factor_test <- as.factor(sample(c("male", "female"), 20,
                                        replace = TRUE))
A_spyre_factor_test2 <- as.factor(sample(c("male", "female"), 200,
                                        replace = TRUE))

A_spyre_factor_test3 <- as.factor(sample(c("male", "female", "other"), 200,
                                        replace = TRUE))

