getCurrentObjects <- function(a, b, c, d) {
    objects <- objects(".GlobalEnv")
    
    objects_list <- lapply(objects, function(x) {
        list(name = x,
             class = class(get(x)),
             dim  = {
                 nr <- nrow(get(x))
                 if(is.null(nr))
                     nr <- length(get(x))
                 nr },
             size = as.character(object.size(get(x))),
             names = {if(!is.null(names(get(x)))) 
                          names(get(x)) }) })

    ## remove children that don't exist
    objects_list <- lapply(objects_list, function(x) {
        
        if(length(x$names) == 0) {
            x$names <- NULL
        }
        return(x)})
    
    ret_list <- list(event = "objects", data = objects_list)
}


X <- list(list(a = pi, b = list(c = 1:1)), d = "a test")

rapply(X, function(x) x, how = "replace")

rapply(X, sqrt, classes = "numeric", how = "replace")

rapply(X, nchar, classes = "character",
       deflt = as.integer(NA), how = "list")
rapply(X, nchar, classes = "character",
       deflt = as.integer(NA), how = "unlist")
rapply(X, nchar, classes = "character", how = "unlist")
rapply(X, log, classes = "numeric", how = "replace", base = 2)

## objects can have one or more classes
lapply(objects(), function(x) class(get(x)))

## we want to recursively check for names until either none or found or we have an atomic object

## test cases
## unnamed vector
t1 <- c(1, 2 ,3)
## named vector
t2 <- c(a = 1, b = 2, c = 3)
## unnamed simple list
t3 <- list(1, 2, 3)
## named simple list
t4 <- list(a = 1, b = 2, c = 1:10)
## which is similar to a data.frame
t5 <- mtcars
## recursive list, no names
t6 <- list(1, 2, list(3,4))
## recursive list, all named
t7 <- list(a = 1, b = 2, c = list(d = 3, e = 4))
## simple list, mixed
t8 <- list(a = 1, 2, c = 3)
## recursive list, mixed
t9 <- list(a = 1, 2, c = list(d = 3, 4))
## complicated example

t10 <- list(a = list(a = 1:10, b = mtcars, data.frame(a = 1:10, b = 2:11)),
            mtcars, c = letters, d.dot_test = mtcars, e = list(mtcars, hi = mtcars, list(1:10)))


rapply(t1, names, classes = "list")
rapply(t2, names)
rapply(t3, names)

rapply(t4, names, how = "replace", classes = "ANY")

rapply(t5, names)
rapply(t6, names)
rapply(t7, names)
rapply(t8, names)
rapply(t9, names)
rapply(t10, names)

## accepted response on SO
names(rapply(t10, length))

## try the examples below (where object is named l, with my most complicated example)
l <- t10


## other options from SO
f <- function(x, parent= "") {
    if(!is.list(x)) {
        return(parent)
    }
    mapply(f, x, paste(parent, "[[", names(x), "]]", sep=""), SIMPLIFY=FALSE)
}

f(l)

## just the names
f <- function(x, parent="") {
    if(!is.list(x)) {
        return(parent)
    }

    named <- if(is.null(names(x))) {
        rep(TRUE, seq_along(x))
    } else {
        ifelse(names(x) == "", TRUE, FALSE)
    }

    unlist(mapply(f, x, paste(parent, "[[", ifelse(named, seq_along(x),
                                                   paste0("\"", names(x), "\"")),
                              "]]", sep= ""), SIMPLIFY=FALSE))
}

f(l)


## now want version that returns the useful structure for %i% defined below
f2 <- function(x, parent = list()) {
    if(!is.list(x)) {
        return(parent)
    }

    named <- if(is.null(names(x))) {
        rep(TRUE, seq_along(x))
    } else {
        ifelse(names(x) == "", TRUE, FALSE)
    }

    ## note quite this, something like it though.
    list(mapply(f2, x, list(label = parent,
                            reference = list(object = substitute(x),
                                index = 
                            children = ..hmmm.. list(ifelse(named, seq_along(x), names(x))))),
                SIMPLIFY = FALSE))
}

## maybe start with a simpler case:
## i think this should return

## we'll need to generate a  tree structure like, possibly much deeper
str(list(label = "t4", data = list(object = "t4", index = NULL),
     children =
     list(label = "a", data = list(root_object = "t4", object_index = list("a")),
          label = "b", data = list(root_object = "t4", object_index = list("b")),
          label = "c", data = list(root_object = "t4", object_index = list("c")))))

f2(t4)
f2(t7)


list("a")
list("b")
list("c")


## label is just for the tree
## reference is the root object, and the list of how to get to it.
## children is the same strcture for child nodes of the main list

generate_tree_data <- function(object, index = 1, parent, object_names) {
    if(missing(parent)) {
        parent <- list(label = as.character(substitute(object)),
                       data = list(root_object = as.character(substitute(object)),
                           object_index = list(as.character(substitute(object)))))
        
    } else {
        parent <- list(label = object_names[index],
                       data= list(root_object = parent$data$root_object,
                           object_index = c(parent$data$object_index,
                               object_names[[index]])))
    }

    if(!is.list(object)) {
        return(parent)
    }


    named <- if(is.null(names(object))) {
        rep(FALSE, length(object))
    } else {
        ifelse(names(object) == "", FALSE, TRUE)
    }
 
    children <- mapply(generate_tree_data,
                       object = object,
                       index = seq_along(object),
                       MoreArgs = list(parent = parent,
                           object_names = ifelse(named, names(object),
                               seq_along(object))),
                       SIMPLIFY = FALSE)

    c(parent, children = list(children))
}

## t6 <- list(1, 2, list(3,4))


system.time(str(generate_tree_data(t1)))
str(generate_tree_data(t2))
str(generate_tree_data(t3))
str(generate_tree_data(t4))
str(generate_tree_data(t5))
str(generate_tree_data(t6))
str(generate_tree_data(t7))
str(generate_tree_data(t8))
str(generate_tree_data(t9))
system.time(str(generate_tree_data(t10)))


## ok but we don't want to get in the habit of eval parsing strings,
## because think about even replacing the NAs in these objects. Don't
## want to go down the road of building up strings to evaluate, eg.,
## deep_list[[1]][[2]][["a"]] <- is

## what if we had a list of indices:

test <- list("e", 1, "hp")

t10[["e"]][[1]][["hp"]]


get_recursive_index <- function(object, index_list) {
    if(length(index_list) == 0)
        return(object)
    object <- do.call("[[", list(object, index_list[[1]]))
    get_recursive_index(object, index_list[-1])
}

`%i%` <- function(object, index_list) {
    if(length(index_list) == 0)
        return(object)
    object <- do.call("[[", list(object, index_list[[1]]))
    object %i% index_list[-1]
}

iget <- function(object_name, index_list) {
    obj <- get(object_name)
    obj %i% index_list
}

t10 %i% test
## great we can now get the object of interest without building up an
## ugly string. now do we compute the list index object on the client
## when they select something on the tree, or send it over as
## branch.data when getCurrentObjects is computed? The latter sounds
## easier.


get_recursive_index(t10, test)
get_recursive_index(t10, list("e", 1))

t10 %i% test

t2 %i% list("a")



## another take on recursion from flodel
collect_names <- function(l) {
  if (!is.list(l)) return(NULL)
  names <- Map(paste, if(is.null(names(l))) rep("", length(l)) else names(l),
                         lapply(l, collect_names), sep = "$")
  gsub("\\$$", "", unlist(names, use.names = FALSE))
}

collect_names(l)

## with this comment

## or you can replace names(l) with if(is.null(names(l)) rep("",
## length(l)) else names(l) to get the same behavior as the other two
## answers currently posted. – flodel Sep 18 '13 at 2:57



    generate_tree_data <- function(object, index = 1, parent, object_names) {

        if(missing(parent)) {
            obj_name <- object
            object <- get(object)
            
            parent <- list(label = unbox(obj_name),
                           data = list(root_object = obj_name,
                               object_index = list(obj_name)))
            
        } else {
            parent <- list(label = unbox(object_names[index]),
                           data= list(root_object = parent$data$root_object,
                               object_index = c(parent$data$object_index,
                                   object_names[[index]])))
        }

        if(!is.list(object)) {
            return(parent)
        }


        named <- if(is.null(names(object))) {
            rep(FALSE, length(object))
        } else {
            ifelse(names(object) == "", FALSE, TRUE)
        }
        
        children <- mapply(generate_tree_data,
                           object = object,
                           index = seq_along(object),
                           MoreArgs = list(parent = parent,
                               object_names = ifelse(named, names(object),
                                   seq_along(object))),
                           SIMPLIFY = FALSE, USE.NAMES=FALSE)

        c(parent, children = list(children))
    }

str(generate_tree_data("mtcars"))
