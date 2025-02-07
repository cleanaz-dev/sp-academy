import React from 'react'

export default function (achievements) {
  return (
    <div>
      {/* Display achievements component here using the provided achievements array. */}
      
      {achievements.map((achievement) => (
        <div key={achievement.id}>
          <h3>{achievement.title}</h3>
          <p>{achievement.description}</p>
          <Image src={achievement.imageUrl} alt={achievement.title} />
        </div>
      ))}
    </div>
  )
}
