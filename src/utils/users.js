function defaultAvatar(firstName, lastName) {
  return `https://eu.ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&bold=true`;
}

module.exports = { defaultAvatar };
