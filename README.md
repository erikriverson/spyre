spyre
=====

Spyre is a web-based companion to the R programming language. It
allows the browser to communicate with a locally running R
process. Spyre has an advanced object explorer, a chart interface,
data importer, and much more.

Spyre does not block the R prompt, so you still have full access to
the R console in your editor of choice. Since it uses a local R
process, you don't have to upload data outside your computer or
network.  It has been tested with both RStudio and Emacs ESS.

Spyre was built to be extensible. Default summaries can easily be
changed, and new tabs can be created by writing simple R functions and
implementing client behavior using the Angular.js JavaScript
framework.

Setup is simple. Spyre is just a plain-old R package that functions as
a local web server to communicate with the browser.

## More information

Project site:

http://spyre.io

Two-minute Intro

http://youtu.be/Vq5W-G0gJHM

Live R Markdown Preview

http://youtu.be/oV0vF8RanK4

## Installation

````
install.packages("devtools")
library(devtools)

install_github("rstudio/httpuv", "rstudio/ggvis")
install_github("erikriverson/spyre/spyre")

library(spyre)
````

## License

Spyre is released under the terms of the MIT License.
