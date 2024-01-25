# Makefile for deploying to neocities
# Borrowing from https://jonathanchang.org/blog/deploying-your-static-site-to-neocities-using-github-actions/

SOURCE_DIR := ./
TARGET_DIR := ./_site
DATE := $(shell /bin/date)

# Define patterns to exclude from the copy operation
EXCLUDE_PATTERNS := $(addprefix --exclude=, $(shell cat $(SOURCE_DIR)/.gitignore))

site: $(TARGET_DIR)/index.html

$(TARGET_DIR)/index.html: $(SOURCE_DIR)/index.html
	mkdir -p $(TARGET_DIR)
	rsync -av --delete $(EXCLUDE_PATTERNS) $(SOURCE_DIR)/ $(TARGET_DIR)/

	rsync -av $(SOURCE_DIR)/images/ $(TARGET_DIR)/images/
clean:
	rm -rf $(TARGET_DIR)

.PHONY: site clean
