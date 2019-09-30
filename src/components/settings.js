import React from "react"
import { graphql } from "gatsby"
import Layout from '../layouts/mainLayout'
import Button from '../components/button'
import { css } from '@emotion/core'
import { BlogContext } from '../context/mainContext'
import { API, graphqlOperation } from 'aws-amplify'
import { updateSettings, createSettings } from '../graphql/mutations'
import { toast } from 'react-toastify'

class Settings extends React.Component {
  updateSettings = async theme => {
    const input = {
      id: 'jamstack-cms-theme-info',
      theme
    }
    console.log('input: ', input)
    try {
      await API.graphql(graphqlOperation(createSettings, { input }))
      console.log('updated theme...')
    } catch (err) {
      if (err.errors[0].message.includes('The conditional request failed')) {
        console.log('theme already set.... Updating theme.')
        try {
          await API.graphql(graphqlOperation(updateSettings, { input }))
          console.log('updated theme...')
        } catch (err) {
          console.log('error updating theme: ', err)
        }
      }
    }
  }
  updateTheme = theme => {
    const { updateTheme } = this.props.context
    this.updateSettings(theme)
    updateTheme(theme)
    toast(`Theme successfully updated.`)
  }

  render() {
    const { theme } = this.props.context
    const {
      highlight, baseFontWeight, primaryFontColor
    } = theme

    const dynamicHighlight = type => css`
      color: ${type === theme.type ? highlight : primaryFontColor};
    ` 
    const themedHeading = css`
      color: ${primaryFontColor};
      font-weight: ${baseFontWeight};
    `

    return (
      <Layout noPadding>
        <p css={[heading, themedHeading]}>Theme</p>
        <div css={[buttonContainer]}>
          <Button
            onClick={() => this.updateTheme('light')}
            title="Light"
            customCss={[dynamicHighlight('light')]}
          />
          <Button
            onClick={() => this.updateTheme('dark')}
            title="Dark"
            customCss={[dynamicHighlight('dark')]}
          />
          <Button
            onClick={() => this.updateTheme('dank')}
            title="Dank"
            customCss={[dynamicHighlight('dank')]}
          />
        </div>
      </Layout>
    )
  }
}

export default function SettingsWthContext(props) {
  return (
    <BlogContext.Consumer>
        {
          context => <Settings {...props} context={context} />
        }
    </BlogContext.Consumer>
  )
}

const heading = css`
  font-weight: 600;
  margin-bottom: 10px;
`

const buttonContainer = css`
  display: flex;
`

const themeQuery = graphql`
  query ThemeQuery {
    allThemeInfo {
      edges {
        node {
          data {
            customStyles
            theme
            categories
          }
        }
      }
    }
  }
`