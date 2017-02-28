import React from 'react'
import { Spinner as MdlSpinner } from 'react-mdl'

const style = {
	margin: 'auto',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed'
}

function Spinner (props) {
	if (props)
	return <MdlSpinner style={style} singleColor />
}

export default Spinner
