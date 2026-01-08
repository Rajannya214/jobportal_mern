import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const PostJob = () => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: "",
    companyId: ""
  })

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { companies } = useSelector(store => store.company)

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find(
      company => company.name.toLowerCase() === value
    )
    setInput({ ...input, companyId: selectedCompany._id })
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    // ✅ frontend validation
    if (!input.companyId) {
      toast.error("Please select a company")
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...input,
        position: Number(input.position),
        salary: Number(input.salary)
      }

      const res = await axios.post(
        `https://jobportal-mern-xk69.onrender.com/post`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      )

      if (res.data.success) {
        toast.success(res.data.message)
        navigate("/admin/jobs")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Job creation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className='flex items-center justify-center w-screen my-5'>
        <form
          onSubmit={submitHandler}
          className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'
        >
          <div className='grid grid-cols-2 gap-2'>
            {[
              ["Title", "title"],
              ["Description", "description"],
              ["Requirements", "requirements"],
              ["Salary", "salary"],
              ["Location", "location"],
              ["Job Type", "jobType"],
              ["Experience Level", "experience"],
              ["No of Position", "position"]
            ].map(([label, name]) => (
              <div key={name}>
                <Label>{label}</Label>
                <Input
                  type={name === "position" || name === "salary" ? "number" : "text"}
                  name={name}
                  value={input[name]}
                  onChange={changeEventHandler}
                  className="my-1"
                />
              </div>
            ))}

            {companies.length > 0 && (
              <Select onValueChange={selectChangeHandler}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies.map(company => (
                      <SelectItem
                        key={company._id}
                        value={company.name.toLowerCase()}
                      >
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          {loading ? (
            <Button className="w-full my-4" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">
              Post New Job
            </Button>
          )}

          {companies.length === 0 && (
            <p className='text-xs text-red-600 font-bold text-center my-3'>
              *Please register a company first
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default PostJob
