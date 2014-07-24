(defun ess-spyre-update-rmarkdown() 
  (interactive)
  (ess-force-buffer-current)
  (ess-command (concat "spyre$send(rmd_explorer('"
                       buffer-file-name "'))\n") nil nil t)
)
 
(add-hook 'R-mode-hook
          (lambda () 
            (add-hook 'after-save-hook 'ess-spyre-update-rmarkdown nil 'make-it-local)))


(add-hook 'markdown-mode-hook
          (lambda () 
            (add-hook 'after-save-hook 'ess-spyre-update-rmarkdown nil 'make-it-local)))
