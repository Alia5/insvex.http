/** @type {import('postcss-load-config').Config} */
import presetEnv from 'postcss-preset-env'
const config = {
    plugins: [
        presetEnv({
            autoprefixer: true,
            stage: 3,
            features: {
                'nesting-rules': true,
            }
        })
    ]
}

export default config