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

# Function to get the best available sound file
get_notification_sound() {
    # First check for custom sounds in the sounds directory
    local custom_ding="$SOUNDS_DIR/ding.wav"
    local custom_notification="$SOUNDS_DIR/notification.aiff"
    
    if [[ -f "$custom_ding" ]]; then
        echo "$custom_ding"
        return
    elif [[ -f "$custom_notification" ]]; then
        echo "$custom_notification"
        return
    fi
    
    # Use macOS system sounds as fallback
    if [[ -f "/System/Library/Sounds/Ping.aiff" ]]; then
        echo "/System/Library/Sounds/Ping.aiff"
    elif [[ -f "/System/Library/Sounds/Glass.aiff" ]]; then
        echo "/System/Library/Sounds/Glass.aiff"
    elif [[ -f "/System/Library/Sounds/Tink.aiff" ]]; then
        echo "/System/Library/Sounds/Tink.aiff"
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
            sound_file=$(get_notification_sound)
            if [[ -n "$sound_file" ]]; then
                play_sound "$sound_file"
            else
                echo -e "\a\a"  # Double bell for task completion
            fi
            ;;
        "human_input")
            echo "⚠️  Human input required! $(date '+%H:%M:%S')"
            sound_file=$(get_notification_sound)
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
            sound_file=$(get_notification_sound)
            if [[ -n "$sound_file" ]]; then
                play_sound "$sound_file"
            else
                echo -e "\a"
            fi
            ;;
        *)
            echo "🔔 Claude Code notification: $event_type $(date '+%H:%M:%S')"
            sound_file=$(get_notification_sound)
            if [[ -n "$sound_file" ]]; then
                play_sound "$sound_file"
            else
                echo -e "\a"
            fi
            ;;
    esac
}

# Check if script is being called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    notify "$@"
fi