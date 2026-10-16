# Numbers locked to raw data: the R helpers for the registry ce_numbers.py checks.
#
#   source("analysis/numbers/ce_numbers.R")
#   register_number("primary.hr", 0.781, kind = "estimate", ci = c(0.664, 0.918),
#                   sources = "data/analytic.parquet", sap_output = "T2")
#   register_table("table1", list(female.overall = list(value = 212, kind = "count", denominator = 412)),
#                  sources = "data/analytic.parquet", sap_output = "T1")
#
# Each entry records the value, its journal-style text, the source files and their
# SHA-256, the producing script with its SHA-256 and git commit, the SAP output ID,
# and a timestamp. Aggregates only: counts from 1 to 10 are stored suppressed,
# without their value. Base R (>= 4.5 for tools::sha256sum) plus jsonlite.

ce_numbers_registry <- file.path("analysis", "numbers", "registry.json")
ce_numbers_kinds <- c("count", "n", "percent", "estimate", "ci", "p")
ce_numbers_styles <- c("jama", "generic-biomedical")
ce_numbers_small_cell <- 11

.ce_git <- function(...) {
  out <- suppressWarnings(tryCatch(system2("git", c(...), stdout = TRUE, stderr = FALSE),
                                   error = function(e) character()))
  if (length(out) == 1 && is.null(attr(out, "status"))) out else NULL
}

.ce_root <- function() {
  root <- .ce_git("rev-parse", "--show-toplevel")
  normalizePath(if (is.null(root)) getwd() else root, mustWork = TRUE)
}

.ce_rel <- function(root, path) {
  full <- normalizePath(if (startsWith(path, "/")) path else file.path(root, path), mustWork = TRUE)
  sub(paste0("^", gsub("([.|()\\^{}+$*?\\[\\]\\\\])", "\\\\\\1", root), "/"), "", full)
}

# Whether the script is tracked and matches HEAD, so its commit names the code that ran.
.ce_committed <- function(root, rel) {
  ok <- function(...) identical(suppressWarnings(system2("git", c("-C", root, ...), stdout = FALSE, stderr = FALSE)), 0L)
  ok("ls-files", "--error-unmatch", "--", rel) && ok("diff", "--quiet", "HEAD", "--", rel)
}

.ce_sha256 <- function(path) unname(as.character(tools::sha256sum(path)))

.ce_calling_script <- function() {
  arg <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
  if (length(arg)) sub("^--file=", "", arg[[1]]) else NULL
}

.ce_fmt <- function(value, digits) sprintf(paste0("%.", digits, "f"), value)

.ce_p <- function(value, style) {
  jama <- style == "jama"
  label <- if (jama) "P" else "p"
  if (value < 0.001) return(paste(label, "<", if (jama) ".001" else "0.001"))
  if (jama && value > 0.99) return(paste(label, "> .99"))
  text <- .ce_fmt(value, if (value < 0.01) 3 else 2)
  paste(label, "=", if (jama) sub("^0", "", text) else text)
}

format_number <- function(value, kind, ci = NULL, digits = 2, denominator = NULL, style = "jama") {
  if (!style %in% ce_numbers_styles) stop("unknown style profile; expected one of ", paste(ce_numbers_styles, collapse = ", "))
  if (kind == "p") return(.ce_p(value, style))
  if (kind %in% c("count", "n")) {
    text <- formatC(value, format = "d", big.mark = ",")
    if (!is.null(denominator) && denominator) text <- paste0(text, " (", .ce_fmt(100 * value / denominator, 1), "%)")
    return(text)
  }
  if (kind == "percent") return(paste0(.ce_fmt(value, digits), "%"))
  interval <- if (is.null(ci)) NULL else
    paste0(.ce_fmt(ci[[1]], digits), if (min(ci) < 0) " to " else "-", .ce_fmt(ci[[2]], digits))
  if (kind == "ci") {
    if (is.null(interval)) stop("kind 'ci' needs ci = c(lower, upper)")
    return(interval)
  }
  text <- .ce_fmt(value, digits)
  if (is.null(interval)) text else paste0(text, " (95% CI, ", interval, ")")
}

.ce_finite <- function(x) is.numeric(x) && length(x) == 1 && is.finite(x)

.ce_entry <- function(root, script, id, value, kind, ci = NULL, digits = 2, denominator = NULL, style = "jama",
                      sources = character(), sap_output = NULL, table = NULL) {
  if (!kind %in% ce_numbers_kinds) stop("unknown kind; expected one of ", paste(ce_numbers_kinds, collapse = ", "))
  if (!.ce_finite(value) || (!is.null(ci) && !all(vapply(ci, .ce_finite, logical(1)))))
    stop(id, ": the registry holds finite numeric aggregates only")
  suppressed <- kind %in% c("count", "n") && value >= 1 && value < ce_numbers_small_cell
  entry <- list(
    id = id,
    value = if (suppressed) NULL else value,
    kind = kind,
    text = if (suppressed) paste0("<", ce_numbers_small_cell) else format_number(value, kind, ci, digits, denominator, style),
    suppressed = suppressed,
    sources = lapply(sources, function(s) list(path = .ce_rel(root, s), sha256 = .ce_sha256(file.path(root, s)))),
    script = if (is.null(script)) NULL else
      list(path = .ce_rel(root, script), sha256 = .ce_sha256(script), commit = .ce_git("-C", root, "rev-parse", "HEAD"),
           committed = .ce_committed(root, .ce_rel(root, script))),
    sap_output = sap_output,
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%S+00:00", tz = "UTC")
  )
  if (!is.null(table)) entry$table <- table
  entry
}

.ce_write <- function(root, registry, entries) {
  path <- file.path(root, registry)
  data <- if (file.exists(path)) jsonlite::read_json(path, simplifyVector = FALSE) else list(version = 1, entries = list())
  if (!length(data$entries)) data$entries <- structure(list(), names = character())
  for (entry in entries) data$entries[[entry$id]] <- entry
  data$entries <- data$entries[order(names(data$entries))]
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  tmp <- paste0(path, ".", Sys.getpid(), ".tmp")
  writeLines(jsonlite::toJSON(data, auto_unbox = TRUE, pretty = TRUE, null = "null", digits = NA), tmp)
  file.rename(tmp, path)
  invisible(NULL)
}

register_number <- function(id, value, kind, ci = NULL, digits = 2, denominator = NULL, style = "jama",
                            sources = character(), sap_output = NULL, script = NULL, registry = ce_numbers_registry) {
  root <- .ce_root()
  if (is.null(script)) script <- .ce_calling_script()
  if (!is.null(script)) script <- normalizePath(script, mustWork = TRUE)
  entry <- .ce_entry(root, script, id, value, kind, ci, digits, denominator, style, sources, sap_output)
  .ce_write(root, registry, list(entry))
  invisible(entry)
}

register_table <- function(table_id, cells, style = "jama", sources = character(), sap_output = NULL,
                           script = NULL, registry = ce_numbers_registry) {
  root <- .ce_root()
  if (is.null(script)) script <- .ce_calling_script()
  if (!is.null(script)) script <- normalizePath(script, mustWork = TRUE)
  entries <- lapply(names(cells), function(cell) {
    spec <- cells[[cell]]
    if (is.null(spec$style)) spec$style <- style
    do.call(.ce_entry, c(list(root = root, script = script, id = paste0(table_id, ".", cell)), spec,
                         list(sources = sources, sap_output = sap_output, table = table_id)))
  })
  .ce_write(root, registry, entries)
  invisible(vapply(entries, function(e) e$id, character(1)))
}
