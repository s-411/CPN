#!/bin/bash

# CPN Claude Code Audio Notification System
# Enhanced notification script for task completion and human input requests

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOUNDS_DIR="$SCRIPT_DIR/sounds"

# Create sounds directory if it doesn't exist
mkdir -p "$SOUNDS_DIR"

# Function to play a sound
play_sound() {
    local sound_file="$1"
    if command -v afplay >/dev/null 2>&1; then
        # macOS
        afplay "$sound_file" 2>/dev/null &
    elif command -v paplay >/dev/null 2>&1; then
        # Linux with PulseAudio
        paplay "$sound_file" 2>/dev/null &
    elif command -v aplay >/dev/null 2>&1; then
        # Linux with ALSA
        aplay "$sound_file" 2>/dev/null &
    elif command -v mpg123 >/dev/null 2>&1; then
        # Generic MP3 player
        mpg123 -q "$sound_file" 2>/dev/null &
    else
        # Fallback to system bell
        echo -e "\a"
    fi
}

# Function to generate a ding sound if no custom sounds exist
generate_ding_sound() {
    local ding_file="$SOUNDS_DIR/ding.wav"
    
    if [[ ! -f "$ding_file" ]]; then
        echo "Generating default ding sound..."
        
        # Try to generate a simple ding using sox if available
        if command -v sox >/dev/null 2>&1; then
            sox -n "$ding_file" synth 0.3 sine 800 fade 0 0.3 0.1 2>/dev/null
        else
            # Create a simple text file as placeholder
            echo "# This is a placeholder for the ding sound" > "$ding_file.txt"
        fi
    fi
    
    if [[ -f "$ding_file" ]]; then
        echo "$ding_file"
    else
        echo ""
    fi
}

# Main notification function
notify() {
    local event_type="${1:-task_complete}"
    
    case "$event_type" in
        "task_complete")
            echo "🔔 Task completed! $(date '+%H:%M:%S')"
            sound_file=$(generate_ding_sound)
            if [[ -n "$sound_file" ]]; then
                play_sound "$sound_file"
            else
                echo -e "\a\a"  # Double bell for task completion
            fi
            ;;
        "human_input")
            echo "⚠️  Human input required! $(date '+%H:%M:%S')"
            sound_file=$(generate_ding_sound)
            if [[ -n "$sound_file" ]]; then
                play_sound "$sound_file"
                sleep 0.2
                play_sound "$sound_file"
                sleep 0.2
                play_sound "$sound_file"
            else
                echo -e "\a\a\a"  # Triple bell for human input
            fi
            ;;
        "error")
            echo "❌ Error occurred! $(date '+%H:%M:%S')"
            echo -e "\a"
            ;;
        *)
            echo "🔔 Claude Code notification: $event_type $(date '+%H:%M:%S')"
            echo -e "\a"
            ;;
    esac
}

# Check if script is being called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    notify "$@"
fi