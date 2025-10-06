# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MTGA Collector - A project for managing Magic: The Gathering Arena card collection data.

## Current State

This is a new repository with minimal setup. The only existing content is example data:
- `example/MTG Arena Collection Page 10 - Test data.csv` - Sample MTG Arena collection export with card positions and quantities

## Data Format

The CSV export format includes:
- **Nummer**: Card number/ID
- **Position X/Y**: Grid position (12 columns wide)
- **Kartenname**: Card name (German locale)
- **Anzahl**: Quantity owned

Cards are arranged in a grid layout (12 columns per row), with position data tracking where each card appears in the MTG Arena collection view.

## Development Setup

No build system, package manager, or testing framework has been configured yet. The project structure and tooling need to be established based on the intended functionality (web app, CLI tool, data processor, etc.).
