spyre <- function(x, ...) {
    UseMethod("spyre")
}

spyre.default <- function(x, ...) {
    summary <- paste(capture.output(str(x)), collapse = "\n")
    ## need a way to limit size of x (likely)
    list(event = "uv", data = list(summary = summary,
                           value = "{}"))
}

spyre.data.frame <- function(x, ...) {
    summary <- paste(capture.output(summary(x)), collapse = "\n")
    list(event = "uv", data = list(summary = summary, value = "{}"))
}


spyre.factor <- function(x, ...) {
    summary <-
        paste0(
            paste0("Factor Levels:\n",
                   paste0("  ", levels(x), collapse = "\n")),
            "\n\nTable:\n",
            paste0(capture.output(table(x, useNA = "always")),
                   collapse = "\n"),
            "\n\nTable (%)\n",
            paste0(capture.output(prop.table(table(x, useNA = "always"))*100),
                   collapse = "\n"))

    value <- data.frame(var = x)

    ggvis_plot <- value  %>% ggvis(~var) %>% layer_bars() %>%
        set_options(width = 420, height = 280)
    ggvis_spec <-
        unbox(paste0(capture.output(show_spec(ggvis_plot)), collapse = ""))
    
    ## need a way to limit size of x (likely)
    list(event = "uv", data = list(summary = summary,
                               value = ggvis_spec))
    
}

spyre.numeric <- function(x, ...) {
    summary <- paste0(paste0(capture.output(summary(x)), collapse = "\n"),
                      "\nVariance/Standard Deviation\n",
                      paste0(round(var(x), 2), "/",
                             round(sd(x), 2)),
                      collapse = "\n")

    value <- data.frame(var = x)

    ggvis_plot <- value  %>% ggvis(~var)  %>% layer_histograms() %>%
        set_options(width = 420, height = 280)
    
    ggvis_spec <-
        unbox(paste0(capture.output(show_spec(ggvis_plot)), collapse = ""))
    
    ## need a way to limit size of x (likely)
    list(event = "uv", data = list(summary = summary,
                               value = ggvis_spec))
    
}


spyre.function <- function(x, ...) {
    value <- paste0(capture.output(print(x)), collapse = "\n")
    list(event = "uv", data = list(summary = value, "{}"))
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


multivariate <- function(x, y, names, ...) {
    message(paste0(names, collapse = " "))
    summary <- paste(c(capture.output(cor(x, y))))

    value <- data.frame(var1 = x, var2 = y)

    ggvis_plot <- value  %>% ggvis(~var1, ~var2) %>% layer_points()
            
    ggvis_spec <-
        unbox(paste0(capture.output(show_spec(ggvis_plot)), collapse = ""))

    ggplot_object <-
        ggplot(value, aes(x = var1, y = var2)) + geom_point()

    tmpfile <- tempfile(tmpdir = "/home/erik/Dropbox/src/projects/spyre/src/client/tmp",
                        fileext = ".png")
    tmpfile_relpath <- paste0(strsplit(tmpfile, "/")[[1]][10:11], collapse = "/")
    
    png(tmpfile)
    print(ggplot_object)
    dev.off()
    
    ## need a way to limit size of x (likely)
    list(event = "mv", data = list(summary = summary, value = ggvis_spec,
                           ggpath = tmpfile_relpath))
}
