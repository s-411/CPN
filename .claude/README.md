# CPN Claude Code Audio Notifications

This directory contains the audio notification system for Claude Code integration with the CPN project.

## Features

- **Built-in Terminal Bell**: Enabled via `claude config set --global preferredNotifChannel terminal_bell`
- **Enhanced Audio Notifications**: Custom script with different sounds for different events
- **Cross-platform Support**: Works on macOS, Linux, and fallback systems
- **Agent OS Integration**: Configured in `.agent-os/config.yml`

## Notification Types

### Task Complete
- **Trigger**: When Claude Code finishes a task
- **Sound**: Single ding sound
- **Visual**: 🔔 Task completed! [timestamp]

### Human Input Required
- **Trigger**: When Claude Code needs user interaction
- **Sound**: Triple ding sound
- **Visual**: ⚠️ Human input required! [timestamp]

### Error
- **Trigger**: When an error occurs
- **Sound**: Single system bell
- **Visual**: ❌ Error occurred! [timestamp]

## Usage

### Manual Testing
```bash
# Test task completion notification
./.claude/notify.sh task_complete

# Test human input notification
./.claude/notify.sh human_input

# Test error notification
./.claude/notify.sh error
```

### Automatic Integration
The system is configured to work automatically with Agent OS. The notification script will be called at appropriate times during Claude Code operations.

## Sound Files

Custom sound files can be placed in `.claude/sounds/` directory:
- `ding.wav` - Main notification sound
- Additional custom sounds can be added and referenced in the script

If no custom sounds are found, the system will:
1. Try to generate a ding sound using `sox` if available
2. Fall back to system terminal bell sounds

## Technical Details

### Dependencies (Optional)
- **macOS**: `afplay` (built-in)
- **Linux**: `paplay` (PulseAudio) or `aplay` (ALSA)
- **Sound Generation**: `sox` for creating custom ding sounds
- **Fallback**: Terminal bell escape sequences

### Configuration Files
- `.agent-os/config.yml` - Agent OS configuration with notification settings
- `.claude/notify.sh` - Main notification script
- `.claude/sounds/` - Directory for custom sound files

## Customization

### Adding Custom Sounds
1. Place audio files (`.wav`, `.mp3`) in `.claude/sounds/`
2. Modify `notify.sh` to reference your custom sounds
3. Test with manual commands

### Extending Notification Types
Edit `notify.sh` and add new cases to the main `notify()` function:

```bash
"custom_event")
    echo "🎯 Custom event! $(date '+%H:%M:%S')"
    play_sound "$custom_sound_file"
    ;;
```

## Troubleshooting

### No Sound on macOS
- Check system volume
- Ensure `afplay` is working: `afplay /System/Library/Sounds/Glass.aiff`

### No Sound on Linux
- Install audio system: `sudo apt-get install pulseaudio-utils` or `alsa-utils`
- Test with: `paplay /usr/share/sounds/alsa/Front_Left.wav`

### Permissions
- Ensure script is executable: `chmod +x .claude/notify.sh`
- Check file permissions for sound files

## Status

✅ **Active**: Terminal bell notifications enabled globally
✅ **Configured**: Agent OS integration setup
✅ **Tested**: Manual notification commands working
🔧 **Ready**: System ready for automatic notifications during Claude Code operations