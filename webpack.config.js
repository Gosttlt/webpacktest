const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development'

const fileName = ext => isDev ? `[name].${ext}` : `[name].[hash]${ext}`

const babelOptions = (preset) => {
    const opts = {
        presets: ['@babel/preset-env']
    }
    if (preset) {
        opts.presets.push(preset)
    }
    return opts
}





module.exports = {
    context: path.resolve(__dirname, 'src'), // base url
    entry: {  // точка входа для приложения
        main: ['@babel/polyfill', './index.jsx'], // точка входя для работы с домом
        analytics: './analytics.ts', // точка входя для аналитики
    },
    output: {
        path: path.resolve(__dirname, 'dist'), // путь для результатов сборки вебпака
        filename: fileName('js'), // названия файла сборки в [name] кладется ключ от точки входа [contenthash] используется для того, что бы при изменении контента у клиента отображались актуальные данные, а не за кешированные под одним и тем же именем
    },
    optimization: { // если библиотека импортируется несколько раз в разных файлах, эта надстройка оптимизирует загрузку позволяя сделать это один раз
        splitChunks: {
            chunks: 'all'
        },
        minimizer: [
            new CssMinimizerPlugin(),
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'], // какие форматы подключать без уазания расширения при импорте
        alias: {
            '@models': path.resolve(__dirname, 'src/models'),
        }
    },
    devServer: {
        port: 3000,
        hot: true,
    },
    devtool: isDev ? 'source-map' : '',
    plugins: [
        new HtmlWebpackPlugin({ // позволяет создавать сборку с автоматическим подключением скриптов
            template: './index.html' // указываем из какого html файла будет создаватся html сборка
        }),
        new CleanWebpackPlugin(), // удаляет не актуальные бандлы
        new CopyPlugin({ //копирование фавиконки в корень сайта
            patterns: [
                { from: "favicon.ico", to: "" },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: fileName('css')
        })
    ],
    module: {
        rules: [ // правила для загрузки файлов через import
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: babelOptions()
                }
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: babelOptions("@babel/preset-typescript")
                }
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: babelOptions("@babel/preset-react")
                }
            },
            {
                test: /\.css$/i, // регулярное вырожение для файла который обявляется черз import
                use: [
                    MiniCssExtractPlugin.loader, //- кладет стили в отдельный файл
                    { loader: 'css-loader' }
                ]
            },
            {
                test: /\.(jpe?g|png|svg|gif)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.less$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ]
    }
};

