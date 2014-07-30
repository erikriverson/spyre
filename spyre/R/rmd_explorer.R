rmd_explorer <- function(doc) {
    rmd_docpath <- rmarkdown::render(doc, quiet = TRUE)
    rmd_content <- paste0(readLines(rmd_docpath), collapse = "\n")
    jsonlite::toJSON(list(event = 'rmd' , data = list(summary = rmd_content,
                                              value = rmd_content)))
}
