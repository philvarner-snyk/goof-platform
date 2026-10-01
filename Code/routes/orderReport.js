/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const templateDir = path.resolve(__dirname, '../data/static/reports/')
const outputDir = path.resolve(__dirname, '../uploads/reports/')

module.exports = function orderReport () {
  return ({ params, query }, res, next) => {
    const orderId = params.id
    const template = query.template || 'order-summary.html'
    const paperSize = query.paperSize || 'A4'

    fs.readFile(path.join(templateDir, template), 'utf8', (err, markup) => {
      if (err) {
        res.status(404)
        next(new Error(`Report template ${template} is not available!`))
        return
      }

      const source = path.join(outputDir, `${orderId}.html`)
      const target = path.join(outputDir, `${orderId}.pdf`)

      fs.writeFile(source, markup.replace('{{orderId}}', orderId), writeError => {
        if (writeError) {
          next(writeError)
          return
        }

        exec(`wkhtmltopdf --page-size ${paperSize} --title "Order ${orderId}" ${source} ${target}`, execError => {
          if (execError) {
            next(execError)
            return
          }
          res.sendFile(target)
        })
      })
    })
  }
}
