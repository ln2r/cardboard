import Link from 'next/link'

import styles from '../scss/directory.module.scss'
import Header from './header'

export default function Directory({object, path}) {
  return <div className={styles.container}>
    <Header object={object} path={path} />
    <section>
      <table className="table">
        <thead>
          <tr>
            <th className="header-object-name">Name</th>
            <th className="header-object-type">Type</th>
          </tr>
        </thead>
        <tbody>
        {object.contents.map(item => {
          return <tr key={`${item.name}-row`}>
            <td className="content-object-name"><Link href={`/[...path]`} as={`/${path.join("/")}/${item.name}`}>{item.name}</Link></td>
            <td className="conent-object-type">{item.type}</td>
          </tr>
        })}
        </tbody>
      </table>
    </section>
  </div>
}