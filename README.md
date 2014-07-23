spyre
=====

Spyre is a web-based companion to the R programming language. It
allows the browser to communicate with a locally running R
process. Spyre shows you information about the current R session, has
an object explorer that enables fast exploratory data analysis, and
more.

Since Spyre uses your local R process, you don't have to upload any
data outside your computer or network. Spyre does not block the R
prompt, so you still have full access to the R console in your editor
of choice. Spyre has been tested with both RStudio and Emacs ESS.

## Installation

````
install.packages("devtools")
library(devtools)

install_github("rstudio/httpuv", "rstudio/ggvis")
install_github("erikriverson/spyre/spyre")

library(spyre)
````
## License

Spyre is released under the MIT License.