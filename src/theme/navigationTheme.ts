import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
    Theme,
} from '@react-navigation/native';

export const MyLightTheme: Theme = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        background: '#fff',
        card: '#fff',
        text: '#000',
        border: '#ccc',
    },
};

export const MyDarkTheme: Theme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        background: '#000',
        card: '#121212',
        text: '#fff',
        border: '#222',
    },
};
