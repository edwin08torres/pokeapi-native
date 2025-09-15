module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@/api": "./src/api",
            "@/hooks": "./src/hooks",
            "@/components": "./src/components",
            "@/screens": "./src/screens",
            "@/store": "./src/store",
            "@/theme": "./src/theme",
            "@/utils": "./src/utils",
          },
        },
      ],
    ],
  };
};
