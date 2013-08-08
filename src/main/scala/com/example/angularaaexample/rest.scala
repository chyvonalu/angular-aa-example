package com.example.angularaaexample

import net.liftweb.http.rest.RestHelper
import net.liftweb.json.JsonAST._
import net.liftweb.http._
import net.liftweb.json.Extraction



class RestService extends RestServiceImpl {
  serve(List("rest") prefix {
    case JsonPost(List("login"), (NameAndPassword(name, pw), _)) => login(name, pw)
    case Post(List("logout"), _) => logout()
    case Get(List("login"), _) => UserSessionVar is
  })
}



class RestServiceImpl extends RestHelper with RestImplicits {
  def login(name: String, pw: String): LiftResponse = {
    Thread.sleep(500) // to see busy icon
    UserSessionVar set User.find(name, pw)
  }

  def logout(): LiftResponse = {
    Thread.sleep(500) // to see busy icon
    UserSessionVar set None
    OkResponse()
  }
}



trait RestImplicits {
  self: RestHelper =>

  val toJson = Extraction.decompose _

  implicit def user2json(x: User): JValue = toJson(Map(
    "name" -> x.name,
    "roles" -> x.roles
  ))

  implicit def option2response[T <% JValue](x: Option[T]): LiftResponse = {
    x.map(x => JsonResponse(x))
      .getOrElse(NotFoundResponse("sorry"))
  }

  implicit def jsonable2response[T <% JValue](x: T): LiftResponse = JsonResponse(x)
}



case class NameAndPassword(name: String, pw: String)

object NameAndPassword {
  def unapply(x: JValue): Option[(String, String)] = {
    (x \ "name", x \ "pw") match {
      case (JString(x), JString(y)) => Some(x, y)
      case _ => None
    }
  }
}



object UserSessionVar extends SessionVar[Option[User]](None)



case class User(name: String, pw: String, roles: List[String])

object User {
  val all = List(
    User("user", "user", List("user")),
    User("admin", "admin", List("admin"))
  )

  def find(name: String, pw: String) = {
    all.find(x => x.name == name && x.pw == pw)
  }
}
