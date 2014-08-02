object_explorer_connect <- function(D) {
    jsonlite::toJSON(object_explorer(iget(D$object), D))
}

object_explorer <- function(x, ...) {
    UseMethod("object_explorer")
}

object_explorer.default <- function(x, ...) {
    summary <- paste(capture.output(str(x)), collapse = "\n")
    ## need a way to limit size of x (likely)
    list(event = "uv", data = list(summary = summary))
}

object_explorer.data.frame <- function(x, ...) {
    summary <- paste(capture.output(summary(x)), collapse = "\n")
    list(event = "uv", data = list(summary = summary))
}

object_explorer.ggvis <- function(x, ...) {
    ggvis_spec <-
        jsonlite::unbox(paste0(capture.output(show_spec(x)), collapse = ""))

    ggvis_explain <- paste(capture.output(explain(x)), collapse = "\n")
    list(event = "uv", data = list(summary=ggvis_explain,
                           value = ggvis_spec))
}


object_explorer.factor <- function(x, ...) {
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
    value <- subset(value, !is.na(var))

    ggvis_plot <- value  %>% ggvis(~var) %>% layer_bars() %>%
        set_options(width = 420, height = 280)
    ggvis_spec <-
        jsonlite::unbox(paste0(capture.output(show_spec(ggvis_plot)), collapse = ""))
    
    ## need a way to limit size of x (likely)
    list(event = "uv", data = list(summary = summary,
                               value = ggvis_spec))
    
}

object_explorer.numeric <- function(x, data, ...) {
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

##    futile.logger::flog.debug(capture.output(str(options)))

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
        jsonlite::unbox(paste0(capture.output(show_spec(gg1)), collapse = ""))

    ## need a way to limit size of x (likely)
    list(event = "uv", data = list(summary = summary,
                               value = ggvis_spec))

}

object_explorer.labelled <- function(x, data, ...) {
    require(Hmisc)
    NextMethod("object_explorer")
}

object_explorer.character <- object_explorer.factor

object_explorer.function <- function(x, name, ...) {
    value <- paste0(capture.output(print(x)), collapse = "\n")
##    futile.logger::flog.debug(name)
##    futile.logger::flog.debug(system.file("help", name, package = "MASS"))
##    help <- readLines(system.file("html", name, package = "MASS")) 
##    help <- rdoc_help(name, package = "MASS")
    help <- "Help stub"

    list(event = "uv", data = list(summary = value, help = help))
}

object_explorer.lm <- function(x, data, ...) {
    value <- paste0(capture.output(summary(x)), collapse = "\n")

    gg_df <- data.frame(resid = resid(x),
                        pred  = predict(x))

    gg1 <- gg_df %>% ggvis(~pred, ~resid) %>% layer_points()

    ggvis_spec <-
        jsonlite::unbox(paste0(capture.output(show_spec(gg1)), collapse = ""))
        
    list(event = "uv", data = list(summary = value,
         value = ggvis_spec))
}
