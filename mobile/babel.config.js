module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.tsx', '.android.tsx', '.tsx', '.ts', '.js', '.json'],
        alias: {'~': './src'},
      },
    ],
  ],
};
