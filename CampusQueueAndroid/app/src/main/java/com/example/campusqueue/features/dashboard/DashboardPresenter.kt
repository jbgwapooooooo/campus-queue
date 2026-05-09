package com.example.campusqueue.features.dashboard

import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.QueueEntry
import com.example.campusqueue.network.models.QueueJoinRequest
import com.example.campusqueue.network.models.Service
import com.example.campusqueue.network.models.SupabaseUserResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class DashboardPresenter(private var view: DashboardContract.View?) : DashboardContract.Presenter {
    private var currentUserId: String? = null

    override fun fetchDashboard() {
        view?.showLoading()
        fetchDashboardData()
    }

    private fun fetchDashboardData() {
        RetrofitClient.instance.getDashboard().enqueue(object : Callback<SupabaseUserResponse> {
            override fun onResponse(call: Call<SupabaseUserResponse>, response: Response<SupabaseUserResponse>) {
                if (response.isSuccessful) {
                    val user = response.body()
                    if (user != null) {
                        currentUserId = user.id
                        fetchServicesAndActiveQueue(user.id)
                    } else {
                        view?.hideLoading()
                        view?.showError("User not found")
                    }
                } else {
                    view?.hideLoading()
                    if (response.code() == 401) view?.onUnauthorized()
                    else view?.showError("Failed to fetch profile")
                }
            }
            override fun onFailure(call: Call<SupabaseUserResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error: ${t.message}")
            }
        })
    }

    private fun fetchServicesAndActiveQueue(userId: String) {
        RetrofitClient.instance.getServices().enqueue(object : Callback<List<Service>> {
            override fun onResponse(call: Call<List<Service>>, response: Response<List<Service>>) {
                if (response.isSuccessful) {
                    val services = response.body() ?: emptyList()
                    val uniqueServices = services.distinctBy { it.name }
                    view?.onServicesLoaded(uniqueServices)
                    
                    RetrofitClient.instance.getMyQueueEntry("eq.$userId").enqueue(object : Callback<List<QueueEntry>> {
                        override fun onResponse(call: Call<List<QueueEntry>>, response: Response<List<QueueEntry>>) {
                            view?.hideLoading()
                            if (response.isSuccessful) {
                                val entries = response.body()
                                if (!entries.isNullOrEmpty()) {
                                    view?.onActiveQueueLoaded(entries.first())
                                } else {
                                    view?.onActiveQueueLoaded(null)
                                }
                            } else {
                                view?.showError("Queue check failed")
                            }
                        }
                        override fun onFailure(call: Call<List<QueueEntry>>, t: Throwable) {
                            view?.hideLoading()
                            view?.showError("Queue networking error")
                        }
                    })
                } else {
                    view?.hideLoading()
                    view?.showError("Services fetch failed")
                }
            }
            override fun onFailure(call: Call<List<Service>>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Services networking error")
            }
        })
    }

    override fun joinQueue(serviceId: Int, currentQueueCount: Int) {
        val uid = currentUserId
        if (uid == null) {
            view?.showError("Please wait for profile to load")
            return
        }
        view?.showLoading()
        
        val req = QueueJoinRequest(uid, serviceId, currentQueueCount + 1)
        RetrofitClient.instance.joinQueue(req).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    view?.onQueueJoined()
                    fetchDashboardData()
                } else {
                    view?.hideLoading()
                    view?.showError("Join failed")
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Join networking error")
            }
        })
    }
    
    override fun onDestroy() { 
        view = null 
    }
}
