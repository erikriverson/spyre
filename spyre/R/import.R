import <- function(file, object_name) {
    D <- substr(D, 22, nchar(file))
    assign(object_name,
           read.table(text = base64Decode(D), header = TRUE, sep = ","),
           pos = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL,
                      get("spyre_clients", pos = "package:spyre"))
}

import_rdata_url <- function(url) {
    tmp <- load(conn <- url(url), envir = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL)

    close(conn)

    if(is.data.frame(obj <- get(tmp))) {
            spyre_message(tmp, "loaded. ", nrow(obj), "rows and ",
            ncol(obj), "columns", type = "success", title = "Import")
    } else {
        spyre_message(tmp, "loaded.", type = "success", title = "Import")
    }
}

import_quandl <- function(quandl_code, object_name) {
    assign(object_name, Quandl(quandl_code), pos = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL, spyre_clients)
    spyre_message(object_name, "loaded.", type = "success", title = "Import")
}

import_http_api <- function(url, object_name) {
    assign(object_name, fromJSON(url), pos = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL, spyre_clients)
    spyre_message(object_name, "loaded.", type = "success", title = "Import")
}

import_sas7bdat_url <- function(url, object_name) {
    assign(object_name, read.sas7bdat(url), pos = .GlobalEnv)
    getCurrentObjects("bootstrap", NULL, NULL, NULL, spyre_clients)
    spyre_message(object_name, "loaded.", type = "success", title = "Import")
}
