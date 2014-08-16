import <- function(file, object_name) {
    D <- substr(D, 22, nchar(file))
    assign(object_name,
           read.table(text = base64Decode(D), header = TRUE, sep = ","),
           pos = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL)
}

import_rdata_url <- function(url) {
    futile.logger::flog.debug(url)
    load(url(url), envir = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL, spyre)
}

import_quandl <- function(quandl_code, object_name) {
    assign(object_name, Quandl(quandl_code), pos = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL, spyre)
}


import_http_url <- function(url, object_name) {
    assign(object_name, fromJSON(url), pos = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL, spyre)
}

import_sas7bdat_url <- function(url, object_name) {
    assign(object_name, fromJSON(url), pos = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL, spyre)
}
