spyre
=====

Spyre is a browser-based companion to the R programming language. It
communicates with a locally running R process, so you don't have to
upload data outside your computer or network. Spyre has an advanced
object explorer, a GUI interface to ggvis, a data importer, R Markdown
previewer, and much more. Setup is simple, as Spyre is a plain-old R
package.

While running, Spyre does not block the R prompt, so you still have
full access to the R console in your editor of choice. It has been
tested with both RStudio and Emacs ESS.

Spyre was built to be extensible. Default summaries can easily be
changed, and new GUI tools that integrate with Spyre can be created by
writing simple R functions and implementing client behavior using the
Angular.js JavaScript framework.

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
install_github("erikriverson/spyre/spyre") ## /spyre/spyre is path to R package

library(spyre)

Visit http://localhost:7681 in your browser
````

## License

Spyre is released under the terms of the MIT License.
