# TransportApp

TransportApp is a cross-platform application for searching and exploring public transport stops, arrivals, and transit information on an interactive map. Built with React Native, Expo, and TypeScript, the app leverages the TransitLand API for real-time transport stop and arrival data, allowing users to easily search, view, and save transit stops.

## Features

- **Interactive Map**: Visualize nearby transport stops (bus, train, etc.) with clustering and zoom support.
- **Search**: Quickly find stops by name or bus code using the built-in search bar.
- **Real-Time Arrivals**: See live arrival times for selected stops.
- **Save Stops**: Save frequently used stops for quick access, with persistent storage.
- **Responsive Design**: Optimized for both mobile and web, including dark mode support.

## Tech Stack

- **React Native** & **Expo**: Cross-platform mobile and web app framework.
- **TypeScript**: Type safety for robust development.
- **TransitLand API**: Real-time transport data source.
- **Zustand**: Lightweight state management.
- **NativeWind & Tailwind CSS**: Utility-first styling for React Native.
- **AsyncStorage**: Persistent storage for saved stops.
- **react-native-clusterer**: Fast clustering of map markers (requires dev build, see below).

## Getting Started

> **Important:** You **must use a development build** (not the standard Expo Go) to run this project, as it relies on native modules provided by `react-native-clusterer`. See [Expo Dev Builds](https://docs.expo.dev/develop/development-builds/introduction/) for instructions.

1. **Install dependencies**:
    ```bash
    npm install
    ```

2. **Configure API Key**:
    - Set your TransitLand API key in environment (`EXPO_PUBLIC_TRANSITLAND_KEY`).

3. **Run the app (Dev Build)**:
    ```bash
    npx expo run:android
    # or
    npx expo run:ios
    ```
    > This builds a custom development client with native module support.

## Folder Structure

- `app/` - Main application screens and components
- `store/` - Zustand stores for app and saved stops state
- `hooks/` - Custom hooks for fetching stops and arrivals

## Example Usage

- **Search for stops:** Enter a stop name or code in the search bar.
- **View arrivals:** Tap on a stop to see real-time arrival information.
- **Save a stop:** Use the save button to add a stop to your favorites.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License

---

**Made by [NichitaCon](https://github.com/NichitaCon)**
