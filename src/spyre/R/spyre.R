spyre <- function(x, ...) {
    UseMethod("spyre")
}

spyre.default <- function(x, ...) {
    summary <- paste(capture.output(str(x)), collapse = "\n")
    ## need a way to limit size of x (likely)
    list(event = "uv", data = list(summary = summary))

}

spyre.data.frame <- function(x, ...) {
    summary <- paste(capture.output(summary(x)), collapse = "\n")
    list(event = "uv", data = list(summary = summary))
}

spyre.ggvis <- function(x, ...) {
    ggvis_spec <-
        unbox(paste0(capture.output(show_spec(x)), collapse = ""))

    ggvis_explain <- paste(capture.output(explain(x)), collapse = "\n")
    list(event = "uv", data = list(summary=ggvis_explain,
                           value = ggvis_spec))
}


spyre.factor <- function(x, ...) {
    summary <-
        paste0(
            paste0("Factor Levels:\n",
                   paste0("  ", levels(x), collapse = "\n")),
            "\n\nTable:\n",
            paste0(capture.output(table(x, useNA = "always"))[-1],
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

spyre.numeric <- function(x, data, ...) {
    options <- data$data
    summary <- paste0(paste0(capture.output(summary(x)), collapse = "\n"),
                      "\nVariance/Standard Deviation\n",
                      paste0(round(var(x), 2), "/",
                             round(sd(x), 2)),
                      collapse = "\n")

    value <- data.frame(var = x)
    value <- subset(value, !is.na(var))

    gg1  <- value  %>% ggvis(~var)  %>%
        set_options(width = 420, height = 280)

    message(str(options))

    ## use angular to check for invalid values, also check here?
    ## e.g., we get a '.' if inputing a decimal value in the text box
    if(options$uv_plot_type == "histogram") {
        if(length(options$uv_plot_binwidth) && options$uv_plot_binwidth != "") {
            gg1 <- gg1 %>% layer_histograms(binwidth =
                                            as.numeric(options$uv_plot_binwidth))
        } else {
            gg1  <- gg1 %>% layer_histograms()
        }
    } else {
        gg1 <- gg1 %>% layer_densities()
    }
    
    ggvis_spec <-
        unbox(paste0(capture.output(show_spec(gg1)), collapse = ""))
    
    ## need a way to limit size of x (likely)
    list(event = "uv", data = list(summary = summary,
                               value = ggvis_spec))

}

spyre.character <- spyre.factor

rdoc_help <- function (fun, package) {
    content(GET(paste0("http://rdocs-staging.herokuapp.com/packages/",
                       package, "/functions/", fun)), as = "text")
}

spyre.function <- function(x, name, ...) {
    value <- paste0(capture.output(print(x)), collapse = "\n")
##    message(name)
##    message(system.file("help", name, package = "MASS"))
##    help <- readLines(system.file("html", name, package = "MASS")) 
##    help <- rdoc_help(name, package = "MASS")
    help <- "Help stub"

    list(event = "uv", data = list(summary = value, help = help))
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


multivariate <- function(x, y, z, names, ...) {
    message(paste0(names, collapse = " "))
    summary <- paste(c(capture.output(cor(x, y))))

    value <- data.frame(var1 = x, var2 = y, var3 = z)
    value <- value[complete.cases(value), ]

    ggvis_plot <- value  %>% ggvis(~var1, ~var2, fill = ~var3) %>% layer_points()
            
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

session <- function(x) {
    session <- paste0(capture.output(sessionInfo()), collapse = "\n")
    message(session)
    list(event = "session", data = list(summary = session))
}

