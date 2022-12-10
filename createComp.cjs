const readline = require('node:readline')
const { stdin: input, stdout: output } = require('node:process')
const shell = require('shelljs')
const rl = readline.createInterface({ input, output })
const fs = require('fs').promises
const fsDefault = require('fs')

async function createComponent(value, location) {
  await fs.writeFile(location, value)
}
function indexString(answer) {
  return `import ${answer}Style from './${answer}.styles'
  import { ${answer}Props } from './${answer}.types'
  
  const ${answer} = ({ _css, ...props }: ${answer}Props) => {
    return (
      <>
        <${answer}Style.Wrap _css={_css} {...props}></$>
      </>
    )
  }
  export default ${answer}`
}
function stylesString(answer) {
  return `import styled from '@emotion/styled/macro'
  import { addCssProps } from '../../themes/styles.helper'

  const ${answer}Style = {
    Wrap: styled.div\`
      \${addCssProps}
    \`,
  }
  
  export default ${answer}Style`
}
function typesString(answer) {
  return `import { AdditionalCss, DivAttributes } from '../../themes/styles.type'

  export interface ${answer}Props extends DivAttributes {
    _css?: AdditionalCss
  }`
}
rl.question('이름이 무엇입니까? ', async (answer) => {
  const currentPath = process.argv[process.argv.length - 1]
  if (!currentPath) {
    rl.close()
  }

  if (!fsDefault.existsSync(`${currentPath}/${answer}`)) {
    await fs.mkdir(`${currentPath}/${answer}`)
  }
  await createComponent(
    indexString(answer),
    `${currentPath}/${answer}/index.tsx`
  )
  await createComponent(
    stylesString(answer),
    `${currentPath}/${answer}/${answer}.styles.tsx`
  )
  await createComponent(
    typesString(answer),
    `${currentPath}/${answer}/${answer}.types.tsx`
  )

  shell.echo(`${currentPath}/${answer}의 위치에 생성했습니다..`)
  shell.exec(`code ${currentPath}/${answer}/index.tsx`)
  rl.close()
  shell.exit()
})
