import { Fragment, useLayoutEffect, useState, type PropsWithChildren } from "react"

import { StyleSheet, Text } from "react-native"

export default function TimedRender({ children }: PropsWithChildren) {
  const [start] = useState(Date.now())

  const [end, setEnd] = useState(0)

  useLayoutEffect(() => {
    setEnd(Date.now())
  }, [])

  return (
    <Fragment>
      {!!end && <Text style={styles.text}>Took {end - start}ms</Text>}
      {children}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  text: { color: "green", margin: 12, fontSize: 18, textAlign: "center" }
})
