# Audio Demo Feature Documentation

## Overview

The Fraud Detection Forensic Systems platform includes optional audio narration for the three use case demonstrations. These narrations provide guided walkthroughs that explain workflows and features as users interact with the interface.

## Architecture

### Server-Side Audio Generation

- **API Routes**: Next.js Route Handlers under `/app/api/demo-audio/[useCase]/route.ts`
- **OpenAI Integration**: Uses OpenAI's Text-to-Speech (TTS) API
- **Caching**: In-memory cache for generated audio (per process lifetime)
- **Security**: API key never exposed to client; all calls server-side

### Audio Player Component

- **Component**: `DemoNarrationPlayer` (`src/components/DemoNarrationPlayer.tsx`)
- **Features**:
  - Play/Pause controls
  - Progress bar with seek functionality
  - Loading states
  - Error handling
  - Auto-hide when feature disabled

## Configuration

### Environment Variables

**Required (Server-Side):**
- `OPENAI_API_KEY` - Your OpenAI API key (set as Fly.io secret)

**Optional (Client-Side):**
- `NEXT_PUBLIC_DEMO_AUDIO_ENABLED` - Feature flag (`true` or `false`, default: `false`)

### Local Development Setup

1. Add to `.env.local`:
```env
NEXT_PUBLIC_DEMO_AUDIO_ENABLED=true
```

2. Set OpenAI API key (server-side only):
```bash
# The API key should be set as an environment variable
# In Next.js, server-side env vars don't need NEXT_PUBLIC_ prefix
export OPENAI_API_KEY=your-key-here
```

### Fly.io Deployment

1. Set the OpenAI API key as a secret:
```bash
fly secrets set OPENAI_API_KEY=your-openai-api-key-here
```

2. Add to `fly.toml`:
```toml
[env]
  NEXT_PUBLIC_DEMO_AUDIO_ENABLED = "true"
```

## Use Cases

### 1. Real-Time Alert Triage

**Script Location**: `src/lib/demo-narration-scripts.ts`

**Narration Content**:
- Explains real-time transaction scoring
- Describes alert table and risk levels
- Covers transaction detail view
- Explains flagging and automatic case creation

**Duration**: ~60 seconds

### 2. Complex Case Investigation

**Narration Content**:
- Explains case filtering and selection
- Describes case timeline and events
- Covers related transactions and entities
- Explains case resolution workflow

**Duration**: ~60 seconds

### 3. Network & Entity Risk Analysis

**Narration Content**:
- Explains entity model and risk scores
- Describes network graph visualization
- Covers entity relationships and fraud rings
- Explains entity blocking actions

**Duration**: ~60 seconds

## API Endpoints

### GET `/api/demo-audio/[useCase]`

Retrieves audio for a specific use case.

**Parameters:**
- `useCase`: One of `real-time-alert-triage`, `complex-case-investigation`, `network-entity-analysis`

**Response:**
- Success: MP3 audio stream with `Content-Type: audio/mpeg`
- Error: JSON error response

**Caching:**
- First request generates audio and caches it
- Subsequent requests serve cached audio
- Cache persists for process lifetime

### POST `/api/demo-audio/[useCase]`

Forces regeneration of audio (clears cache and regenerates).

**Use Cases:**
- Updating narration scripts
- Changing voice settings
- Debugging audio generation

## Customization

### Updating Narration Scripts

1. Edit `src/lib/demo-narration-scripts.ts`
2. Modify the script text for the desired use case
3. Restart the server or call `POST /api/demo-audio/[useCase]` to regenerate

### Changing Voice Settings

Edit `src/app/api/demo-audio/[useCase]/route.ts`:

**Voice Options:**
- `alloy` - Neutral, balanced
- `echo` - Clear, articulate
- `fable` - Expressive
- `onyx` - Deep, authoritative
- `nova` - Professional, neutral (default)
- `shimmer` - Warm, friendly

**Model Options:**
- `tts-1` - Standard quality, faster
- `tts-1-hd` - Higher quality, slower

**Example:**
```typescript
const mp3 = await openai.audio.speech.create({
  model: 'tts-1-hd',  // Higher quality
  voice: 'onyx',      // Different voice
  input: script,
  response_format: 'mp3',
});
```

## Performance Considerations

### Caching Strategy

- **In-Memory Cache**: Fast but lost on server restart
- **Production Recommendation**: Consider Redis or file-based caching for persistence
- **Cache Size**: Each audio file is ~500KB-1MB (MP3)

### Cost Optimization

- Audio is generated once per use case per server instance
- Cached audio reduces API calls
- Consider pre-generating audio at build time for production

### Browser Caching

- Audio responses include `Cache-Control` headers
- Browsers cache audio files locally
- Reduces server load for repeat visitors

## Troubleshooting

### Audio Not Loading

1. **Check Feature Flag**: Verify `NEXT_PUBLIC_DEMO_AUDIO_ENABLED=true`
2. **Check API Key**: Ensure `OPENAI_API_KEY` is set server-side
3. **Check Console**: Look for error messages in browser console
4. **Check Network**: Verify API route is accessible

### Audio Generation Fails

1. **API Key**: Verify OpenAI API key is valid
2. **Rate Limits**: Check OpenAI API rate limits
3. **Script Length**: Ensure scripts are within TTS limits
4. **Network**: Check server can reach OpenAI API

### Audio Playback Issues

1. **Browser Support**: Ensure browser supports MP3 playback
2. **Autoplay Policy**: Audio won't auto-play (browser restriction)
3. **Permissions**: Check browser audio permissions

## Security Best Practices

1. **Never Expose API Key**: Keep `OPENAI_API_KEY` server-side only
2. **Feature Flag**: Use `NEXT_PUBLIC_DEMO_AUDIO_ENABLED` to control access
3. **Rate Limiting**: Consider adding rate limiting to API routes
4. **Validation**: Validate use case parameters to prevent abuse

## Future Enhancements

Potential improvements:

1. **Persistent Caching**: Use Redis or file storage for cache persistence
2. **Multiple Languages**: Support narration in multiple languages
3. **Custom Scripts**: Allow users to customize narration scripts
4. **Audio Quality Options**: Let users choose audio quality
5. **Transcript Display**: Show narration text alongside audio
6. **Playback Speed**: Allow users to adjust playback speed

## Support

For issues or questions:
- Check the main README.md for general troubleshooting
- Review OpenAI API documentation for TTS-specific issues
- Contact system administrator for deployment questions

